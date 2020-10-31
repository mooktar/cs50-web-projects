from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Posts, Profile

import json
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt


def paginate_posts(request, allposts):
    paginator = Paginator(allposts.reverse(), 10)
    if request.GET.get("page") != None:
        try:
            posts = paginator.page(request.GET.get("page"))
        except:
            posts = paginator.page(1)
    else:
        posts = paginator.page(1)
    return posts


def index(request):
    if request.user.is_authenticated:
        all_posts = Posts.objects.all().order_by('timestamp')
        profile = Profile.objects.get(user=request.user)
        posts = paginate_posts(request, all_posts)
        return render(request, "network/index.html", {
            "posts": posts,
            "profile": profile,
        })

    return HttpResponseRedirect(reverse("login"))


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        profile = Profile(user=user)
        profile.save()
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def add_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "Post request required!"}, status=400)

    post = json.loads(request.body).get("post")
    newpost = Posts(user=request.user, post=post)
    newpost.save()
    return JsonResponse({
        # "message": "Post added successfuly!",
        "status": 201,
        "id": newpost.id,
        "user": newpost.user.username,
        "post": newpost.post,
        "timestamp": newpost.timestamp.strftime("%B %d, %Y, %I:%M %p"),
    }, status=201)


@login_required
def profile(request, username):
    try:
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user)
        users_profile = Profile.objects.get(user=request.user)
    except:
        return render(request, "network/profile.html", {"error": "Can't get Profile for this user."})

    profile_posts = Posts.objects.filter(user=user).all().order_by("timestamp")
    posts = paginate_posts(request, profile_posts)

    return render(request, "network/profile.html", {
        "posts": posts,
        "profile": users_profile,
        "p_user": user,
        "p_profile": profile,
    })


@login_required
def following(request):
    following = Profile.objects.get(user=request.user).following.all()
    following_posts = Posts.objects.filter(
        user__in=following).all().order_by("timestamp")
    posts = paginate_posts(request, following_posts)
    profile = Profile.objects.get(user=request.user)
    return render(request, "network/following.html", {
        "posts": posts,
        "profile": profile,
    })


@csrf_exempt
@login_required
def edit_post(request, post_id):
    if request.method != "POST":
        return JsonResponse({"error": "Post request required!"}, status=400)

    post = json.loads(request.body).get("post-to-edit")
    this_post = Posts.objects.get(id=post_id)
    this_post.post = post
    this_post.save()
    return JsonResponse({}, status=201)


@csrf_exempt
@login_required
def like_post(request):

    if request.method != "POST":
        return JsonResponse({"error": "Post request required."}, status=400)

    post_id = json.loads(request.body).get("post-id")
    liked = json.loads(request.body).get("post-liked")

    try:
        post = Posts.objects.get(id=post_id)
    except:
        return JsonResponse({"error": "Post not found."})

    if liked == "false":
        post.like.add(request.user)
        liked = "true"
    else:
        post.like.remove(request.user)
        liked = "false"

    post.save()
    return JsonResponse({"likes": post.like.count(), "liked": liked}, status=201)


@csrf_exempt
@login_required
def follow(request):
    if request.method == "POST":
        body = json.loads(request.body)
        user_id = body.get("user-id")
        followed = body.get("followed")

        try:
            user = User.objects.get(id=user_id)
            request_profile = Profile.objects.get(user=request.user)
            user_profile = Profile.objects.get(user=user)
        except:
            return JsonResponse({"error": "Profiles doesn't exist."})

        if followed == "Follow":
            request_profile.following.add(user)
            user_profile.follower.add(request.user)
            followed = "Unfollow"
        else:
            request_profile.following.remove(user)
            user_profile.follower.remove(request.user)
            followed = "Follow"

        request_profile.save()
        user_profile.save()
        return JsonResponse({
            "message": "Following successfuly",
            "followed": followed,
            "followers": user_profile.follower.count(),
            "following": user_profile.following.count(),
        }, status=201)
    else:
        return JsonResponse({"error": "Post request required."}, status=400)
