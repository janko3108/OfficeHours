from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.http import JsonResponse, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from datetime import datetime, timedelta
from .models import OfficeHour
from django.utils import timezone
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
import json

# Import the default SetupCompleteView from two_factor
from two_factor.views import SetupCompleteView
from api.models import UserProfile  # Make sure this import is correct

# ----------------------------
# CUSTOM COMPLETE VIEW
# ----------------------------


class CustomSetupCompleteView(SetupCompleteView):
    def dispatch(self, request, *args, **kwargs):
        print("CustomSetupCompleteView.dispatch called.")
        if request.user.is_authenticated:
            try:
                # Update the profile record directly
                updated_count = UserProfile.objects.filter(user=request.user).update(two_factor_completed=True)
                print("UserProfile updated count:", updated_count)
                # Refresh the user object from the database so that changes are visible.
                request.user.refresh_from_db()
                print("After update, two_factor_completed:", request.user.profile.two_factor_completed)
            except Exception as e:
                print("Error updating profile for user", request.user.username, ":", e)
        else:
            print("CustomSetupCompleteView: User is not authenticated!")
        return HttpResponseRedirect("http://localhost:4200/home/")
# ----------------------------
# WEB/API VIEWS
# ----------------------------

@login_required
def current_user(request):
    user = request.user
    two_factor_completed = bool(getattr(user, 'profile', None) and user.profile.two_factor_completed)
    return JsonResponse({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'isAdmin': user.is_staff,
        'two_factor_completed': two_factor_completed
    })

def home(request):
    if request.user.is_authenticated:
        if request.user.is_staff:
            return redirect('admin_dashboard')
        else:
            return redirect('student_dashboard')
    return render(request, 'dashboard.html')

def student_register(request):
    if request.method == 'POST':
        print("student_register: POST received")
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        
        if not (username and email and password and confirm_password):
            return JsonResponse({'error': 'All fields are required.'}, status=400)
        if password != confirm_password:
            return JsonResponse({'error': 'Passwords do not match.'}, status=400)
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists.'}, status=400)
        
        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            login(request, user)
            request.session.save()
            print("student_register: User created and logged in:", username)
            redirect_url = "http://localhost:8000/account/two_factor/setup/?next=http://localhost:8000/custom-2fa-complete/"
            print("student_register: Redirecting to 2FA setup with URL:", redirect_url)
            return JsonResponse({'redirect': redirect_url})
        except IntegrityError as e:
            print("student_register: IntegrityError:", e)
            return JsonResponse({'error': 'An error occurred. Please try again.'}, status=400)
    
    return redirect('home')

def cancel_registration(request):
    if request.user.is_authenticated and (not (getattr(request.user, 'profile', None) and request.user.profile.two_factor_completed)):
        print("cancel_registration: Deleting incomplete user:", request.user.username)
        request.user.delete()
    return redirect("http://localhost:4200/home/")

def student_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            if user.is_staff:
                return redirect('admin_dashboard')
            else:
                return redirect('student_dashboard')
        else:
            return render(request, 'login.html', {'error': 'Invalid credentials'})
    return render(request, 'login.html')

def student_logout(request):
    logout(request)
    request.session.flush()
    return JsonResponse({'message': 'Logged out successfully'})

@login_required
def student_dashboard(request):
    # If 2FA is not complete, return a JSON error so Angular can handle it.
    if not (getattr(request.user, 'profile', None) and request.user.profile.two_factor_completed):
        return JsonResponse({
            'error': 'Two-factor authentication incomplete',
            'complete_profile': False
        }, status=403)
    
    try:
        week_offset = int(request.GET.get('week', 0))
    except ValueError:
        week_offset = 0
    now = timezone.localtime(timezone.now())
    start_of_week = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(weeks=week_offset)
    week_days = [start_of_week + timedelta(days=i) for i in range(5)]
    time_slots = [start_of_week.replace(hour=8) + timedelta(hours=i) for i in range(8)]
    start_datetime = start_of_week
    end_datetime = start_of_week + timedelta(days=5)
    week_bookings = OfficeHour.objects.filter(booking_time__gte=start_datetime, booking_time__lt=end_datetime)
    bookings_dict = {}
    for booking in week_bookings:
        local_booking_time = timezone.localtime(booking.booking_time)
        key = f"{local_booking_time.date()}|{local_booking_time.hour}"
        bookings_dict[key] = {
            'id': booking.id,
            'student': booking.student.username,
            'booking_time': booking.booking_time.isoformat(),
        }
    data = {
        'week_days': [day.isoformat() for day in week_days],
        'time_slots': [slot.isoformat() for slot in time_slots],
        'bookings_dict': bookings_dict,
        'week_offset': week_offset,
    }
    return JsonResponse(data)

@staff_member_required
def admin_dashboard(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    bookings = OfficeHour.objects.all()
    bookings_list = [{
        'id': b.id,
        'student': b.student.username,
        'booking_time': b.booking_time.isoformat(),
        'created_at': b.created_at.isoformat()
    } for b in bookings]
    return JsonResponse({'bookings': bookings_list})

@login_required
def book_office_hour(request):
    if request.method == 'POST':
        booking_time_str = request.POST.get('booking_time')
        try:
            booking_time = datetime.strptime(booking_time_str, "%Y-%m-%dT%H:%M")
        except ValueError:
            return render(request, 'book_office_hour.html', {'error': 'Invalid booking time format.'})
        if OfficeHour.objects.filter(booking_time=booking_time).exists():
            return render(request, 'book_office_hour.html', {'error': 'This time slot is already booked. Please choose another time.'})
        OfficeHour.objects.create(student=request.user, booking_time=booking_time)
        return redirect('student_dashboard')
    prefill = {}
    day = request.GET.get('day')
    hour = request.GET.get('hour')
    if day and hour:
        try:
            prefill['booking_time'] = f"{day}T{int(hour):02d}:00"
        except ValueError:
            pass
    return render(request, 'book_office_hour.html', {'prefill': prefill})

@staff_member_required
def admin_edit_booking(request, booking_id):
    try:
        booking = OfficeHour.objects.get(id=booking_id)
    except OfficeHour.DoesNotExist:
        return redirect('admin_dashboard')
    if request.method == 'POST':
        booking_time_str = request.POST.get('booking_time')
        try:
            new_booking_time = datetime.strptime(booking_time_str, "%Y-%m-%dT%H:%M")
        except ValueError:
            context = {'error': 'Invalid booking time format.', 'booking': booking}
            return render(request, 'admin_edit_booking.html', context)
        if OfficeHour.objects.filter(booking_time=new_booking_time).exclude(id=booking.id).exists():
            context = {'error': 'This time slot is already booked by another user.', 'booking': booking}
            return render(request, 'admin_edit_booking.html', context)
        booking.booking_time = new_booking_time
        booking.save()
        return redirect('admin_dashboard')
    context = {'booking': booking}
    return render(request, 'admin_edit_booking.html', context)

@csrf_exempt
@staff_member_required
def admin_delete_booking(request, booking_id):
    try:
        booking = OfficeHour.objects.get(id=booking_id)
    except OfficeHour.DoesNotExist:
        return JsonResponse({'error': 'Booking not found'}, status=404)
    
    if request.method == 'DELETE':
        booking.delete()
        return JsonResponse({'message': 'Booking deleted successfully'})
    else:
        return JsonResponse({'error': 'Only DELETE method is allowed'}, status=405)

def check_email(request):
    email = request.GET.get('email', '').strip()
    exists = User.objects.filter(email=email).exists()
    return JsonResponse({'exists': exists})

def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return JsonResponse({'message': 'Login successful'})
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
    return JsonResponse({'error': 'Only POST allowed'}, status=405)

@csrf_exempt
@staff_member_required
def admin_edit_booking_api(request, booking_id):
    try:
        booking = OfficeHour.objects.get(id=booking_id)
    except OfficeHour.DoesNotExist:
        return JsonResponse({'error': 'Booking not found'}, status=404)

    if request.method == 'GET':
        data = {
            'id': booking.id,
            'booking_time': booking.booking_time.isoformat()
        }
        return JsonResponse(data)

    elif request.method == 'PUT':
        try:
            body = json.loads(request.body)
            new_booking_time_str = body.get('booking_time')
            new_booking_time = datetime.strptime(new_booking_time_str, "%Y-%m-%dT%H:%M")
        except Exception as e:
            return JsonResponse({'error': 'Invalid booking time format'}, status=400)

        if OfficeHour.objects.filter(booking_time=new_booking_time).exclude(id=booking.id).exists():
            return JsonResponse({'error': 'This time slot is already booked by another user.'}, status=400)

        booking.booking_time = new_booking_time
        booking.save()
        return JsonResponse({'message': 'Booking updated successfully'})

    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
@login_required
def complete_2fa(request):
    """
    API endpoint that marks two-factor authentication as complete.
    Optionally, you can add token verification here.
    """
    if request.method == 'POST':
        try:
            profile = request.user.profile
            profile.two_factor_completed = True
            profile.save()
            request.user.refresh_from_db()
            print(f"2FA marked complete for user: {request.user.username}")
            return JsonResponse({'message': '2FA marked as complete.'})
        except Exception as e:
            print("Error updating 2FA status:", e)
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'POST required.'}, status=405)