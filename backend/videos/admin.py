from django.contrib import admin
from .models import Video, Category, Like, Comment


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'status', 'views_count', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('title', 'author__email')
    readonly_fields = ('views_count', 'created_at', 'updated_at')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'video', 'created_at')
