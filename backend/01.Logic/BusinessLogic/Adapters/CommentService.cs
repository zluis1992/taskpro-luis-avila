using AutoMapper;
using BusinessLogic.Ports;
using Domain.Entity;
using Domain.Exceptions;
using Domain.Interface;
using Infrastructure.Dto.Comment;
using MongoDB.Bson;

namespace BusinessLogic.Adapters;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepository;
    private readonly ITaskRepository _taskRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly IMapper _mapper;

    public CommentService(
        ICommentRepository commentRepository,
        ITaskRepository taskRepository,
        IProjectRepository projectRepository,
        IMapper mapper)
    {
        _commentRepository = commentRepository;
        _taskRepository = taskRepository;
        _projectRepository = projectRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CommentDto>> GetByTaskAsync(int taskId, int userId)
    {
        await EnsureTaskAccessAsync(taskId, userId);
        var comments = await _commentRepository.GetByTaskAsync(taskId);
        return _mapper.Map<IEnumerable<CommentDto>>(comments);
    }

    public async Task<CommentDto> CreateAsync(int taskId, CreateCommentRequest request, int authorId, string authorName)
    {
        await EnsureTaskAccessAsync(taskId, authorId);

        var comment = new Comment
        {
            Id = ObjectId.GenerateNewId().ToString(),
            TaskId = taskId,
            AuthorId = authorId,
            AuthorName = authorName,
            Content = request.Content,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _commentRepository.AddAsync(comment);
        return _mapper.Map<CommentDto>(created);
    }

    public async Task<CommentDto> UpdateAsync(string commentId, UpdateCommentRequest request, int userId)
    {
        var comment = await _commentRepository.GetByIdAsync(commentId)
            ?? throw new NotFoundException(nameof(Comment), commentId);

        if (comment.AuthorId != userId)
            throw new UnauthorizedException("You can only edit your own comments.");

        comment.Content = request.Content;
        comment.UpdatedAt = DateTime.UtcNow;

        await _commentRepository.UpdateAsync(comment);
        return _mapper.Map<CommentDto>(comment);
    }

    public async Task DeleteAsync(string commentId, int userId)
    {
        var comment = await _commentRepository.GetByIdAsync(commentId)
            ?? throw new NotFoundException(nameof(Comment), commentId);

        if (comment.AuthorId != userId)
            throw new UnauthorizedException("You can only delete your own comments.");

        await _commentRepository.DeleteAsync(commentId);
    }

    private async Task EnsureTaskAccessAsync(int taskId, int userId)
    {
        var task = await _taskRepository.GetByIdWithDetailsAsync(taskId)
            ?? throw new NotFoundException(nameof(TaskItem), taskId);

        var project = await _projectRepository.GetByIdWithDetailsAsync(task.ProjectId)
            ?? throw new NotFoundException(nameof(Domain.Entity.Project), task.ProjectId);

        if (project.OwnerId != userId && !project.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedException();
    }
}
