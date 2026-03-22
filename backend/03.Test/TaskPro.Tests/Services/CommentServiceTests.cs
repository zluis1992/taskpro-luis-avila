using AutoMapper;
using BusinessLogic.Adapters;
using Domain.Entity;
using Domain.Exceptions;
using Domain.Interface;
using FluentAssertions;
using Infrastructure.Dto.Comment;
using Infrastructure.Mapper;
using Moq;

namespace TaskPro.Tests.Services;

public class CommentServiceTests
{
    private readonly Mock<ICommentRepository> _commentRepoMock = new();
    private readonly Mock<ITaskRepository> _taskRepoMock = new();
    private readonly Mock<IProjectRepository> _projectRepoMock = new();
    private readonly IMapper _mapper;

    public CommentServiceTests()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();
    }

    private CommentService CreateService() =>
        new(_commentRepoMock.Object, _taskRepoMock.Object, _projectRepoMock.Object, _mapper);

    private static Project CreateProject(int id, int ownerId) =>
        new() { Id = id, OwnerId = ownerId, Members = new List<ProjectMember>() };

    private static TaskItem CreateTask(int id, int projectId) =>
        new() { Id = id, ProjectId = projectId };

    [Fact]
    public async Task GetByTaskAsync_WhenAuthorized_ShouldReturnComments()
    {
        var comments = new List<Comment>
        {
            new() { Id = "1", TaskId = 1, Content = "Hola", AuthorName = "Luis" },
            new() { Id = "2", TaskId = 1, Content = "Ok", AuthorName = "Ana" }
        };
        _taskRepoMock.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(CreateTask(1, 10));
        _projectRepoMock.Setup(r => r.GetByIdWithDetailsAsync(10)).ReturnsAsync(CreateProject(10, 5));
        _commentRepoMock.Setup(r => r.GetByTaskAsync(1)).ReturnsAsync(comments);

        var result = await CreateService().GetByTaskAsync(1, userId: 5);

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByTaskAsync_WhenNotAuthorized_ShouldThrowUnauthorizedException()
    {
        _taskRepoMock.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(CreateTask(1, 10));
        _projectRepoMock.Setup(r => r.GetByIdWithDetailsAsync(10)).ReturnsAsync(CreateProject(10, 99));

        await CreateService().Invoking(s => s.GetByTaskAsync(1, userId: 5))
            .Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateCommentWithAuthorInfo()
    {
        _taskRepoMock.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(CreateTask(1, 10));
        _projectRepoMock.Setup(r => r.GetByIdWithDetailsAsync(10)).ReturnsAsync(CreateProject(10, 5));
        _commentRepoMock.Setup(r => r.AddAsync(It.IsAny<Comment>()))
            .ReturnsAsync((Comment c) => c);

        var request = new CreateCommentRequest { Content = "Mi comentario" };
        var result = await CreateService().CreateAsync(1, request, authorId: 5, "Luis");

        result.Content.Should().Be("Mi comentario");
        result.AuthorName.Should().Be("Luis");
        result.AuthorId.Should().Be(5);
    }

    [Fact]
    public async Task UpdateAsync_WhenNotAuthor_ShouldThrowUnauthorizedException()
    {
        var comment = new Comment { Id = "1", AuthorId = 99, Content = "Original" };
        _commentRepoMock.Setup(r => r.GetByIdAsync("1")).ReturnsAsync(comment);

        var request = new UpdateCommentRequest { Content = "Editado" };
        await CreateService().Invoking(s => s.UpdateAsync("1", request, userId: 5))
            .Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task UpdateAsync_WhenAuthor_ShouldUpdateContent()
    {
        var comment = new Comment { Id = "1", AuthorId = 5, Content = "Original" };
        _commentRepoMock.Setup(r => r.GetByIdAsync("1")).ReturnsAsync(comment);
        _commentRepoMock.Setup(r => r.UpdateAsync(It.IsAny<Comment>())).Returns(Task.CompletedTask);

        var request = new UpdateCommentRequest { Content = "Editado" };
        var result = await CreateService().UpdateAsync("1", request, userId: 5);

        result.Content.Should().Be("Editado");
        result.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateAsync_WhenNotFound_ShouldThrowNotFoundException()
    {
        _commentRepoMock.Setup(r => r.GetByIdAsync("99")).ReturnsAsync((Comment?)null);

        var request = new UpdateCommentRequest { Content = "X" };
        await CreateService().Invoking(s => s.UpdateAsync("99", request, 1))
            .Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DeleteAsync_WhenNotAuthor_ShouldThrowUnauthorizedException()
    {
        var comment = new Comment { Id = "1", AuthorId = 99 };
        _commentRepoMock.Setup(r => r.GetByIdAsync("1")).ReturnsAsync(comment);

        await CreateService().Invoking(s => s.DeleteAsync("1", userId: 5))
            .Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task DeleteAsync_WhenAuthor_ShouldDelete()
    {
        var comment = new Comment { Id = "1", AuthorId = 5 };
        _commentRepoMock.Setup(r => r.GetByIdAsync("1")).ReturnsAsync(comment);
        _commentRepoMock.Setup(r => r.DeleteAsync("1")).Returns(Task.CompletedTask);

        await CreateService().DeleteAsync("1", userId: 5);

        _commentRepoMock.Verify(r => r.DeleteAsync("1"), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenNotFound_ShouldThrowNotFoundException()
    {
        _commentRepoMock.Setup(r => r.GetByIdAsync("99")).ReturnsAsync((Comment?)null);

        await CreateService().Invoking(s => s.DeleteAsync("99", 1))
            .Should().ThrowAsync<NotFoundException>();
    }
}
