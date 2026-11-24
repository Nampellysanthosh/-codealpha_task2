from django.urls import include, path
from rest_framework.routers import DefaultRouter

from posts.api_views import CommentViewSet, PostViewSet
from users.api_views import AuthViewSet, ProfileViewSet

router = DefaultRouter()
router.register('auth', AuthViewSet, basename='auth')
router.register('profiles', ProfileViewSet, basename='profiles')
router.register('posts', PostViewSet, basename='posts')
router.register('comments', CommentViewSet, basename='comments')

urlpatterns = [
    path('', include(router.urls)),
]
