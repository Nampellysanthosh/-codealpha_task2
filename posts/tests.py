from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient


class SocialFeatureTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='postuser',
            email='post@example.com',
            password='StrongPass123!',
        )
        self.client.force_authenticate(self.user)

    def test_create_comment_like_and_delete_post(self):
        post_response = self.client.post('/api/posts/', {'content': 'Test post'}, format='json')
        self.assertEqual(post_response.status_code, 201)
        post_id = post_response.json()['id']

        comment_response = self.client.post('/api/comments/', {
            'post': post_id,
            'content': 'Test comment',
        }, format='json')
        self.assertEqual(comment_response.status_code, 201)

        like_response = self.client.post(f'/api/posts/{post_id}/like/', {}, format='json')
        self.assertTrue(like_response.json()['liked'])

        unlike_response = self.client.post(f'/api/posts/{post_id}/like/', {}, format='json')
        self.assertFalse(unlike_response.json()['liked'])

        delete_response = self.client.delete(f'/api/posts/{post_id}/')
        self.assertEqual(delete_response.status_code, 204)

    def test_user_cannot_edit_another_users_post(self):
        other = User.objects.create_user(username='other', password='StrongPass123!')
        post_response = self.client.post('/api/posts/', {'content': 'Owned post'}, format='json')
        post_id = post_response.json()['id']
        self.client.force_authenticate(other)

        update_response = self.client.patch(
            f'/api/posts/{post_id}/',
            {'content': 'Changed'},
            format='json',
        )
        self.assertEqual(update_response.status_code, 403)

    def test_follow_toggle(self):
        target = User.objects.create_user(username='target', password='StrongPass123!')

        follow_response = self.client.post(f'/api/profiles/{target.id}/follow/', {}, format='json')
        self.assertTrue(follow_response.json()['following'])

        unfollow_response = self.client.post(f'/api/profiles/{target.id}/follow/', {}, format='json')
        self.assertFalse(unfollow_response.json()['following'])
