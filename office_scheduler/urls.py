from django.contrib import admin 
from django.urls import path, include
from django.shortcuts import redirect
from api import views as api_views
from two_factor import urls as two_factor_urls_module

urlpatterns = [    
    # Include two_factor URLs (if used)

    
    path('accounts/login/', lambda request: redirect('two_factor:login'), name='accounts_login'),

    
    # Redirect /login/ to two_factor login
    path('login/', lambda request: redirect('two_factor:login'), name='login'),
    
    # Home view: This now checks authentication and routes accordingly.
    path('', api_views.home, name='home'),
    
    # Include API endpoints (for logged-in actions)
    path('', include('api.urls')),
]
