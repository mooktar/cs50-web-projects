from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Posts(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_posts")
    post = models.TextField(max_length=350, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    like = models.ManyToManyField(User, blank=True, related_name="like")

    def __str__(self):
        return f"{self.id} {self.user.username}"


class Profile(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_profile")
    follower = models.ManyToManyField(
        User,  blank=True, related_name="follower")
    following = models.ManyToManyField(
        User,  blank=True, related_name="following")

    def __str__(self):
        return f"{self.id} {self.user.username}"
