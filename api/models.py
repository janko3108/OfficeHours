from django.db import models
from django.contrib.auth.models import User

class OfficeHour(models.Model):
    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='bookings'
    )
    booking_time = models.DateTimeField(help_text="Select your desired booking time")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} booked {self.booking_time}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    two_factor_completed = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username
