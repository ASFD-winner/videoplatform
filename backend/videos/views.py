from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Video, Category, Like, Comment
from .serializers import (
    VideoListSerializer, VideoDetailSerializer, VideoCreateSerializer,
    CategorySerializer, CommentSerializer
)


class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class VideoListView(generics.ListAPIView):
    serializer_class = VideoListSerializer
    permission_classes = (permissions.AllowAny,)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'author__username']
    ordering_fields = ['created_at', 'views_count', 'likes_count']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Video.objects.filter(status='published').select_related('author', 'category')
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        return queryset


class VideoCreateView(generics.CreateAPIView):
    serializer_class = VideoCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)


class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Video.objects.select_related('author', 'category').prefetch_related('comments__user', 'likes')
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly)

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return VideoCreateSerializer
        return VideoDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class UserVideosView(generics.ListAPIView):
    serializer_class = VideoListSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Video.objects.filter(author_id=user_id, status='published').select_related('author', 'category')


class MyVideosView(generics.ListAPIView):
    serializer_class = VideoListSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Video.objects.filter(author=self.request.user).select_related('author', 'category')


class VideoLikeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        video = get_object_or_404(Video, pk=pk)
        like, created = Like.objects.get_or_create(user=request.user, video=video)
        if not created:
            like.delete()
            return Response({'liked': False, 'likes_count': video.likes.count()})
        return Response({'liked': True, 'likes_count': video.likes.count()}, status=status.HTTP_201_CREATED)


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_queryset(self):
        return Comment.objects.filter(video_id=self.kwargs['pk']).select_related('user')

    def perform_create(self, serializer):
        video = get_object_or_404(Video, pk=self.kwargs['pk'])
        serializer.save(user=self.request.user, video=video)


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)


class VideoStreamView(APIView):
    """Возвращает прямую ссылку на видеофайл для потокового воспроизведения."""
    permission_classes = (permissions.AllowAny,)

    def get(self, request, pk):
        video = get_object_or_404(Video, pk=pk, status='published')
        if not video.video_file:
            return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)
        video_url = request.build_absolute_uri(video.video_file.url)
        return Response({'url': video_url, 'title': video.title})
