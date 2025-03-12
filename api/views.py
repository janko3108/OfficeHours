from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.urls import reverse
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.models import User
from django.db import IntegrityError
from rest_framework import generics, permissions
from rest_framework.authtoken.views import ObtainAuthToken
from .serializers import UserRegistrationSerializer, OfficeHourSerializer
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from datetime import datetime, timedelta
from .models import OfficeHour
from django.utils import timezone
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
import json


# --- DRF API VIEWS ---
class UserRegistrationAPIView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

class OfficeHourBookingAPIView(generics.ListCreateAPIView):
    serializer_class = OfficeHourSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return OfficeHour.objects.all()
        return OfficeHour.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

class CustomObtainAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super(CustomObtainAuthToken, self).post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data['token'])
        return Response({'token': token.key, 'user_id': token.user_id})

# --- WEB/API VIEWS ---

@login_required
def current_user(request):
    user = request.user
    return JsonResponse({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'isAdmin': user.is_staff
    })

def home(request):
    # This view won't be used for UI; Angular handles the landing page.
    if request.user.is_authenticated:
        if request.user.is_staff:
            return redirect('admin_dashboard')
        else:
            return redirect('student_dashboard')
    return render(request, 'dashboard.html')  # You might remove this if not used.

def student_register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        if password != confirm_password:
            context = {'error': 'Passwords do not match.'}
            return render(request, 'register.html', context)
        if User.objects.filter(username=username).exists():
            context = {'error': 'Username already exists. Please choose another.'}
            return render(request, 'register.html', context)
        try:
            user = User.objects.create_user(username=username, email=email, password=password)
            login(request, user)
            return redirect(reverse('two_factor:setup') + '?next=/dashboard/')
        except IntegrityError:
            context = {'error': 'Username already exists. Please choose another.'}
            return render(request, 'register.html', context)
    return render(request, 'register.html')

def student_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            if request.headers.get('Content-Type') == 'application/json':
                return JsonResponse({'message': 'Login successful'})
            else:
                if user.is_staff:
                    return redirect('admin_dashboard')
                else:
                    return redirect('student_dashboard')
        else:
            if request.headers.get('Content-Type') == 'application/json':
                return JsonResponse({'error': 'Invalid credentials'}, status=400)
            else:
                return render(request, 'login.html', {'error': 'Invalid credentials'})
    return render(request, 'login.html')

def student_logout(request):
    logout(request)
    request.session.flush()  # Ensure the session data is cleared
    return JsonResponse({'message': 'Logged out successfully'})

@login_required
def student_dashboard(request):
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

@csrf_exempt  # Remove or use csrf_protect if you pass a valid CSRF token in the header
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

@csrf_exempt  # For testing; ideally, handle CSRF properly.
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

@csrf_exempt  # Use proper CSRF protection in production!
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