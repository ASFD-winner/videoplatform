from django.urls import path
from .views import (
    VideoListView, VideoCreateView, VideoDetailView,
    UserVideosView, MyVideosView, VideoLikeView,
    CommentListCreateView, CategoryListView, VideoStreamView
)

urlpatterns = [
    path('', VideoListView.as_view(), name='video-list'),
    path('create/', VideoCreateView.as_view(), name='video-create'),
    path('my/', MyVideosView.as_view(), name='my-videos'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('<int:pk>/', VideoDetailView.as_view(), name='video-detail'),
    path('<int:pk>/like/', VideoLikeView.as_view(), name='video-like'),
    path('<int:pk>/comments/', CommentListCreateView.as_view(), name='video-comments'),
    path('<int:pk>/stream/', VideoStreamView.as_view(), name='video-stream'),
    path('user/<int:user_id>/', UserVideosView.as_view(), name='user-videos'),
]
