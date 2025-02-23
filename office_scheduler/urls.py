from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
from scheduler import views as scheduler_views

urlpatterns = [
    path('admin/', admin.site.urls),
    # Include two_factor URLs without an extra "account/" prefix.
    path('', include('two_factor.urls')),
    
    # If you want /login/ to redirect to the two_factor login, do this:
    path('login/', lambda request: redirect('two_factor:login'), name='login'),
    
    # Home view and your app's URLs:
    path('', scheduler_views.home, name='home'),
    path('', include('scheduler.urls')),
]
