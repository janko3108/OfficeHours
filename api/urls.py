from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.student_register, name='register'),
    
    # Use the custom API login view that returns JSON (for Angular)
    path('login/', views.api_login, name='api_login'),
    
    path('logout/', views.student_logout, name='logout'),
    path('dashboard/', views.student_dashboard, name='student_dashboard'),
    path('book/', views.book_office_hour, name='book_office_hour'),
    path('api/check_email/', views.check_email, name='check_email'),
    
    # Admin booking management 
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('manage/booking/edit/<int:booking_id>/', views.admin_edit_booking, name='admin_edit_booking'),
    path('manage/booking/delete/<int:booking_id>/', views.admin_delete_booking, name='admin_delete_booking'),
    
    # CSRF endpoint for Angular to obtain a CSRF cookie
    path('csrf/', views.get_csrf_token, name='get_csrf_token'),
]
