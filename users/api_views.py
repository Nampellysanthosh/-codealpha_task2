from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Follow
from .serializers import RegisterSerializer, UserProfileSerializer, UserSerializer


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def login(self, request):
        identifier = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        user = authenticate(request, username=identifier, password=password)
        if user is None and '@' in identifier:
            try:
                matching_user = User.objects.get(email__iexact=identifier)
                user = authenticate(request, username=matching_user.username, password=password)
            except User.DoesNotExist:
                user = None
        if user is None:
            return Response({'detail': 'Invalid username or password.'}, status=status.HTTP_400_BAD_REQUEST)
        login(request, user)
        return Response(UserSerializer(user).data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        logout(request)
        return Response({'detail': 'Logged out successfully.'})

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user).data)


class ProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.select_related('profile').all()
    serializer_class = UserSerializer

    def get_queryset(self):
        search = self.request.query_params.get('search', '').strip()
        queryset = super().get_queryset()
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(profile__full_name__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        if request.method == 'PATCH':
            user_serializer = UserSerializer(request.user, data=request.data, partial=True)
            user_serializer.is_valid(raise_exception=True)
            user_serializer.save()
            profile_data = request.data.get('profile', {})
            if profile_data:
                profile_serializer = UserProfileSerializer(request.user.profile, data=profile_data, partial=True)
                profile_serializer.is_valid(raise_exception=True)
                profile_serializer.save()
        return Response(UserSerializer(request.user).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def follow(self, request, pk=None):
        target = self.get_object()
        if target == request.user:
            return Response({'detail': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        relationship, created = Follow.objects.get_or_create(follower=request.user, following=target)
        if not created:
            relationship.delete()
            return Response({'following': False})
        return Response({'following': True})
