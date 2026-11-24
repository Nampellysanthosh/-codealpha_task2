from django.contrib.auth.models import User
from django.test import TestCase


class DashboardNavigationTests(TestCase):
    def test_dashboard_links_go_to_existing_pages(self):
        response = self.client.get('/home/')

        self.assertEqual(response.status_code, 200)
        for path in [
            '/home/',
            '/search/',
            '/notifications/',
            '/messages/',
            '/saved/',
        ]:
            with self.subTest(path=path):
                self.assertContains(response, f'href="{path}"')

    def test_profile_navigation_uses_logged_in_username(self):
        user = User.objects.create_user(username='navigation_user', password='TestPass123!')
        self.client.force_login(user)

        response = self.client.get('/home/')

        self.assertContains(response, 'href="/profiles/navigation_user/"')

    def test_navigation_sections_render(self):
        for path, title in [
            ('/notifications/', 'Notifications'),
            ('/messages/', 'Messages'),
            ('/saved/', 'Saved posts'),
        ]:
            with self.subTest(path=path):
                response = self.client.get(path)
                self.assertEqual(response.status_code, 200)
                self.assertContains(response, title)
