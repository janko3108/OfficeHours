from django.contrib import admin 
from django.urls import path, include
from django.shortcuts import redirect
from scheduler import views as scheduler_views
from two_factor import urls as two_factor_urls_module

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Unpack the two_factor URLconf tuple:
    path(
        '', 
        include(
            (two_factor_urls_module.urlpatterns[0], two_factor_urls_module.urlpatterns[1]),
            namespace='two_factor'
        )
    ),
    
    # Redirect /login/ to the two_factor login URL.
    path('login/', lambda request: redirect('two_factor:login'), name='login'),
    
    # Home view and your app's URLs:
    path('', scheduler_views.home, name='home'),
    path('', include('scheduler.urls')),
]
