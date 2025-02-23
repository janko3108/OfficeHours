from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate  # Added authenticate here
from django.urls import reverse
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.models import User
from django.db import IntegrityError

# Django REST Framework imports (if needed)
from rest_framework import generics, permissions
from rest_framework.authtoken.views import ObtainAuthToken

from .serializers import UserRegistrationSerializer, OfficeHourSerializer
from django.shortcuts import redirect
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from datetime import datetime, timedelta
from django.shortcuts import render
from .models import OfficeHour


# ========= DRF API VIEWS =========

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

# ========= WEB VIEWS =========


def home(request):
    if request.user.is_authenticated:
        return redirect('student_dashboard')
    else:
        return redirect('register')

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
            # Redirect to 2FA setup page; after enrollment, redirect to dashboard.
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
            if user.is_staff:
                return redirect('admin_dashboard')
            else:
                return redirect('student_dashboard')
        else:
            return render(request, 'login.html', {'error': 'Invalid credentials'})
    return render(request, 'login.html')

def student_logout(request):
    logout(request)
    return redirect('login')

@login_required
def student_dashboard(request):
    # Get week offset from GET parameter (default 0 for current week)
    try:
        week_offset = int(request.GET.get('week', 0))
    except ValueError:
        week_offset = 0

    today = datetime.today()
    # Calculate Monday of the current week and adjust by week_offset
    start_of_week = (today - timedelta(days=today.weekday())) + timedelta(weeks=week_offset)
    # Only include weekdays: Monday (0) to Friday (4)
    week_days = [start_of_week + timedelta(days=i) for i in range(5)]
    
    # Define time slots from 8:00 to 15:00 (8 slots: 8-9, 9-10, ..., 15-16)
    time_slots = [start_of_week.replace(hour=8, minute=0, second=0, microsecond=0) + timedelta(hours=i) for i in range(8)]
    
    # Get all bookings for the week (for all users)
    start_datetime = start_of_week
    # End at the end of Friday (start_of_week + 5 days)
    end_datetime = start_of_week + timedelta(days=5)
    week_bookings = OfficeHour.objects.filter(booking_time__gte=start_datetime, booking_time__lt=end_datetime)
    
    # Build a dictionary mapping a key "YYYY-MM-DD|H" to the booking
    bookings_dict = {}
    for booking in week_bookings:
        key = f"{booking.booking_time.date()}|{booking.booking_time.hour}"
        bookings_dict[key] = booking

    context = {
        'week_days': week_days,
        'time_slots': time_slots,
        'bookings_dict': bookings_dict,
        'week_offset': week_offset,
    }
    return render(request, 'student_dashboard.html', context)



def admin_dashboard(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return redirect('login')
    bookings = OfficeHour.objects.all()
    return render(request, 'admin_dashboard.html', {'bookings': bookings})

@login_required
def book_office_hour(request):
    if request.method == 'POST':
        booking_time_str = request.POST.get('booking_time')
        try:
            booking_time = datetime.strptime(booking_time_str, "%Y-%m-%dT%H:%M")
        except ValueError:
            return render(request, 'book_office_hour.html', {'error': 'Invalid booking time format.'})
        
        # Check if a booking already exists for this time
        if OfficeHour.objects.filter(booking_time=booking_time).exists():
            return render(request, 'book_office_hour.html', {'error': 'This time slot is already booked. Please choose another time.'})
        
        OfficeHour.objects.create(student=request.user, booking_time=booking_time)
        return redirect('student_dashboard')
    
    # For GET requests, try to prefill the form if parameters are provided.
    prefill = {}
    day = request.GET.get('day')
    hour = request.GET.get('hour')
    if day and hour:
        try:
            # Format a datetime string that the booking form expects (e.g., datetime-local input)
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
        
        # Ensure no other booking exists at this new time
        if OfficeHour.objects.filter(booking_time=new_booking_time).exclude(id=booking.id).exists():
            context = {'error': 'This time slot is already booked by another user.', 'booking': booking}
            return render(request, 'admin_edit_booking.html', context)
        
        booking.booking_time = new_booking_time
        booking.save()
        return redirect('admin_dashboard')
    
    context = {'booking': booking}
    return render(request, 'admin_edit_booking.html', context)

@staff_member_required
def admin_delete_booking(request, booking_id):
    try:
        booking = OfficeHour.objects.get(id=booking_id)
    except OfficeHour.DoesNotExist:
        return redirect('admin_dashboard')
    
    if request.method == 'POST':
        booking.delete()
        return redirect('admin_dashboard')
    
    context = {'booking': booking}
    return render(request, 'admin_delete_booking.html', context)


def check_email(request):
    email = request.GET.get('email', '').strip()
    exists = User.objects.filter(email=email).exists()
    return JsonResponse({'exists': exists})
