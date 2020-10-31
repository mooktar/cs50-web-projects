from django.db import models

from django.contrib.auth.models import AbstractUser

# Create your models here.


class User(AbstractUser):
    pass


class Projects(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    due_date = models.CharField(max_length=65)
    members = models.ManyToManyField(User, blank=False, related_name="members")
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title}"
    
    def serialize(self):
        return {
            "id": self.id,
            "user": self.user,
            "title": self.title,
            "description": self.description,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "due_date": self.due_date,
            "members": [member for member in self.members.all()],
            "completed": self.completed,
        }


class Boards(models.Model):
    project = models.ForeignKey(
        Projects, on_delete=models.CASCADE, null=False, related_name="boards")
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name}"


class Cards(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="creator_by")
    board = models.ForeignKey(
        Boards, on_delete=models.CASCADE, null=False, related_name="cards")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}"


class Tasks(models.Model):
    card = models.ForeignKey(
        Cards, on_delete=models.CASCADE, blank=False, related_name="tasks")
    body = models.TextField(blank=True)
    checked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.body} - {self.checked}"

    def serialize(self):
        return {
            "id": self.id,
            "card": self.card,
            "body": self.body,
            "checked": self.checked
        }
