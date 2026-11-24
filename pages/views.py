from django.shortcuts import render


def landing(request):
    return render(request, 'landing.html')


def login_page(request):
    return render(request, 'login.html')


def register_page(request):
    return render(request, 'register.html')


def home_feed(request):
    return render(request, 'home.html')


def search_page(request):
    return render(request, 'search.html')


def profile_page(request, username):
    return render(request, 'profile.html', {'profile_username': username})


def section_page(request, section):
    sections = {
        'notifications': {
            'title': 'Notifications',
            'description': 'You will see activity from people you follow here.',
            'icon': 'bell',
        },
        'messages': {
            'title': 'Messages',
            'description': 'Your conversations will appear here when messaging is available.',
            'icon': 'message-circle',
        },
        'saved': {
            'title': 'Saved posts',
            'description': 'Posts you save for later will appear here.',
            'icon': 'bookmark',
        },
    }
    return render(request, 'section.html', {
        'section': section,
        **sections[section],
    })
