from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def validate_email(self, value):
        email_validator = EmailValidator()
        try:
            email_validator(value)
        except ValidationError:
            raise serializers.ValidationError("Invalid email format.")
        
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserSerializer(serializers.ModelSerializer):
    def validate_avatar(self, value):
        max_size = 200*1024  
        valid_types = ["image/jpeg", "image/png"]
        if value:
            if value.size > max_size:
                raise ValidationError("Max file size is 200 KB.")
            if hasattr(value, 'content_type') and value.content_type not in valid_types:
                raise ValidationError("Only JPEG and PNG images are allowed.")
        return value

    # add avatar and get_avatar for returning URL instead of absolute path
    avatar = serializers.SerializerMethodField()
    def get_avatar(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'desc', 'avatar', 'is_2fa_enabled')