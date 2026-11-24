from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Follow, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['full_name', 'bio', 'profile_picture', 'cover_image', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=120)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value.lower()

    def create(self, validated_data):
        full_name = validated_data.pop('full_name')
        user = User.objects.create_user(**validated_data)
        user.profile.full_name = full_name
        user.profile.save()
        return user
