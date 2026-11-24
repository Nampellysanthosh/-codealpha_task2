from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_creates_profile_and_logs_in(self):
        response = self.client.post('/api/auth/register/', {
            'full_name': 'Test User',
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'StrongPass123!',
        }, format='json')

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username='testuser')
        self.assertEqual(user.profile.full_name, 'Test User')

        me_response = self.client.get('/api/auth/me/')
        self.assertEqual(me_response.status_code, 200)

    def test_login_with_email(self):
        user = User.objects.create_user(
            username='emailuser',
            email='email@example.com',
            password='StrongPass123!',
        )
        response = self.client.post('/api/auth/login/', {
            'username': 'email@example.com',
            'password': 'StrongPass123!',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['username'], user.username)

    def test_duplicate_username_is_rejected(self):
        User.objects.create_user(username='duplicate', password='StrongPass123!')
        response = self.client.post('/api/auth/register/', {
            'full_name': 'Duplicate',
            'username': 'duplicate',
            'email': 'new@example.com',
            'password': 'StrongPass123!',
        }, format='json')

        self.assertEqual(response.status_code, 400)
