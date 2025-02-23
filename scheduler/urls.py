from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.student_register, name='register'),
    # Note: Use the two_factor login view for 2FA login (e.g., /account/login/),
    # so do not override it with your custom login view if you want 2FA.
    path('login/', views.student_login, name='login'),

    path('logout/', views.student_logout, name='logout'),
    path('dashboard/', views.student_dashboard, name='student_dashboard'),
    path('book/', views.book_office_hour, name='book_office_hour'),
    path('api/check_email/', views.check_email, name='check_email'),

    
    # Admin booking management 
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('manage/booking/edit/<int:booking_id>/', views.admin_edit_booking, name='admin_edit_booking'),
    path('manage/booking/delete/<int:booking_id>/', views.admin_delete_booking, name='admin_delete_booking'),

    
    # Other URLs (e.g., API endpoints)...
]
