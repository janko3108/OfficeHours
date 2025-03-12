from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),

    # API endpoints for registration, login, logout, etc.
    path('register/', views.student_register, name='register'),
    path('login/', views.api_login, name='api_login'),
    path('logout/', views.student_logout, name='logout'),
    path('book/', views.book_office_hour, name='book_office_hour'),
    path('api/check_email/', views.check_email, name='check_email'),

    # Admin booking management endpoints
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('manage/booking/edit/<int:booking_id>/', views.admin_edit_booking, name='admin_edit_booking'),
    path('manage/booking/delete/<int:booking_id>/', views.admin_delete_booking, name='admin_delete_booking'),

    # CSRF endpoint for Angular to obtain a CSRF cookie
    path('csrf/', views.get_csrf_token, name='get_csrf_token'),

    # For the "dashboard" landing page (when not logged in or as the front end)
    # redirect the user to the Angular dashboard.
    path('dashboard/', lambda request: redirect('http://localhost:4200/dashboard/'), name='dashboard'),
]
