from rest_framework import serializers
from django.contrib.auth.models import User
from .models import OfficeHour

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])  # Securely hashes the password
        user.save()
        return user

class OfficeHourSerializer(serializers.ModelSerializer):
    student = serializers.ReadOnlyField(source='student.username')

    class Meta:
        model = OfficeHour
        fields = ('id', 'student', 'booking_time', 'created_at')
