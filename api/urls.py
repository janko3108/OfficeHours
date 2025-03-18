from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from two_factor import urls as two_factor_urls_module
from api import views as api_views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Expose CSRF endpoint.
    path('csrf/', api_views.get_csrf_token, name='get_csrf_token'),
    
    # API endpoints under /api/
    path('api/', include([
        path('register/', api_views.student_register, name='register'),
        path('login/', api_views.api_login, name='api_login'),
        path('book/', api_views.book_office_hour, name='book_office_hour'),
        path('check_email/', api_views.check_email, name='check_email'),
        path('dashboard/', api_views.student_dashboard, name='student_dashboard'),
        path('admin-dashboard/', api_views.admin_dashboard, name='admin_dashboard'),
        path('manage/booking/delete/<int:booking_id>/', api_views.admin_delete_booking, name='admin_delete_booking'),
        path('current-user/', api_views.current_user, name='current_user'),
        path('manage/booking/edit/<int:booking_id>/', api_views.admin_edit_booking_api, name='admin_edit_booking_api'),
        path('complete-2fa/', api_views.complete_2fa, name='complete_2fa'),
    ])),
    
    # Logout endpoint.
    path('logout/', api_views.student_logout, name='logout'),
    
    # CUSTOM 2FA COMPLETE VIEW:
    path('custom-2fa-complete/', api_views.CustomSetupCompleteView.as_view(), name='custom_setup_complete'),

    # Include two_factor URLs for all other two-factor functionality.
    path('', include((two_factor_urls_module.urlpatterns[0], two_factor_urls_module.urlpatterns[1]), namespace='two_factor')),
    
    # Redirect /login/ to two_factor's login view.
    path('login/', lambda request: redirect('two_factor:login'), name='login'),
    
    # Catch-all redirect to Angular landing page.
    path('', lambda request: redirect('http://localhost:4200/home/')),
]
