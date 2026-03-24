using AutoMapper;
using BusinessLogic.Adapters;
using Domain.Entity;
using Domain.Exceptions;
using Domain.Interface;
using FluentAssertions;
using Infrastructure.Dto.Task;
using Infrastructure.Mapper;
using Moq;

namespace TaskPro.Tests.Services;

public class TaskServiceTests
{
    private readonly Mock<ITaskRepository> _taskRepoMock = new();
    private readonly Mock<IProjectRepository> _projectRepoMock = new();
    private readonly Mock<ICommentRepository> _commentRepoMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();
    private readonly IMapper _mapper;

    public TaskServiceTests()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = config.CreateMapper();
    }

    private TaskService CreateService() =>
        new(_taskRepoMock.Object, _projectRepoMock.Object, _commentRepoMock.Object, _unitOfWorkMock.Object, _mapper);

    private static Project CreateProject(int id, int ownerId) =>
        new() { Id = id, OwnerId = ownerId, Members = new List<ProjectMember>() };

    private static Project CreateProjectWithMember(int id, int ownerId, int memberId) =>
        new() { Id = id, OwnerId = ownerId, Members = new List<ProjectMember> { new() { UserId = memberId } } };

    [Fact]
    public async Task GetAllForUserAsync_ShouldReturnAllTasks()
    {
        var tasks = new List<TaskItem>
        {
            new() { Id = 1, Title = "T1", ProjectId = 1 },
            new() { Id = 2, Title = "T2", ProjectId = 1 }
        };
        _taskRepoMock.Setup(r => r.GetAllForUserAsync(1)).ReturnsAsync(tasks);

        var result = await CreateService().GetAllForUserAsync(1);

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotFound_ShouldThrowNotFoundException()
    {
        _taskRepoMock.Setup(r => r.GetByIdWithDetailsAsync(99)).ReturnsAsync((TaskItem?)null);

        await CreateService().Invoking(s => s.GetByIdAsync(99, 1))
            .Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetByIdAsync_WhenNotMember_ShouldThrowUnauthorizedException()
    {
        var task = new TaskItem { Id = 1, ProjectId = 10 };
        _taskRepoMock.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(task);
        _projectRepoMock.Setup(r => r.GetByIdWithDetailsAsync(10)).ReturnsAsync(CreateProject(10, 99));

        await CreateService().Invoking(s => s.GetByIdAsync(1, userId: 5))
            .Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task GetByIdAsync_WhenOwner_ShouldReturnTask()
    {
        var task = new TaskItem { Id = 1, Title = "Mi tarea", ProjectId = 10 };
        _taskRepoMock.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(task);
        _projectRepoMock.Setup(r => r.GetByIdWithDetailsAsync(10)).ReturnsAsync(CreateProject(10, 5));

        var result = await CreateService().GetByIdAsync(1, userId: 5);

        result.Should().NotBeNull();
        result.Title.Should().Be("Mi tarea");
    }

    [Fact]
    public async Task GetByIdAsync_WhenMember_ShouldReturnTask()
    {
        var task = new TaskItem { Id = 1, Title = "Tarea compartida", ProjectId = 10 };
        _taskRepoMock.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(task);
        _projectRepoMock.Setup(r => r.GetByIdWithDetailsAsync(10)).ReturnsAsync(CreateProjectWithMember(10, 99, 5));

        var result = await CreateService().GetByIdAsync(1, userId: 5);

        result.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateAsync_ShouldTrimTitleAndDescription()
    {
        var request = new CreateTaskRequest
        {
            ProjectId = 10,
            Title = "  Mi tarea  ",
            Description = "  Descripción  ",
            Priority = 1
        };
        _projectRepoMock.Setup(r => r.GetByIdWithDetailsAsync(10)).ReturnsAsync(CreateProject(10, 5));
        _taskRepoMock.Setup(r => r.AddAsync(It.IsAny<TaskItem>()))
            .ReturnsAsync((TaskItem t) => { t.Id = 1; return t; });
        _taskRepoMock.Setup(r => r.GetByIdWithDetailsAsync(1))
            .ReturnsAsync(new TaskItem { Id = 1, Title = "Mi tarea", Description = "Descripción", ProjectId = 10 });

        var result = await CreateService().CreateAsync(request, userId: 5);

        result.Title.Should().Be("Mi tarea");
        result.Description.Should().Be("Descripción");
    }

    [Fact]
    public async Task CreateAsync_WhenNotMember_ShouldThrowUnauthorizedException()
    {
        var request = new CreateTaskRequest { ProjectId = 10, Title = "Test" };
        _projectRepoMock.Setup(r => r.GetByIdWithDetailsAsync(10)).ReturnsAsync(CreateProject(10, 99));

        await CreateService().Invoking(s => s.CreateAsync(request, userId: 5))
            .Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task UpdateAsync_WhenNotFound_ShouldThrowNotFoundException()
    {
        _taskRepoMock.Setup(r => r.GetByIdWithDetailsAsync(99)).ReturnsAsync((TaskItem?)null);

        var request = new UpdateTaskRequest { Title = "Updated" };
        await CreateService().Invoking(s => s.UpdateAsync(99, request, 1))
            .Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateFields()
    {
        var task = new TaskItem { Id = 1, Title = "Old", ProjectId = 10 };
        _taskRepoMock.Setup(r => r.GetByIdWithDetailsAsync(1)).ReturnsAsync(task);
        _projectRepoMock.Setup(r => r.GetByIdWithDetailsAsync(10)).ReturnsAsync(CreateProject(10, 5));
        _taskRepoMock.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>())).Returns(Task.CompletedTask);
        _taskRepoMock.Setup(r => r.GetByIdWithDetailsAsync(1))
            .ReturnsAsync(new TaskItem { Id = 1, Title = "Updated", ProjectId = 10 });

        var request = new UpdateTaskRequest { Title = "  Updated  ", Description = "New desc", Status = 1, Priority = 2 };
        var result = await CreateService().UpdateAsync(1, request, userId: 5);

        result.Title.Should().Be("Updated");
    }

    [Fact]
    public async Task DeleteAsync_ShouldSoftDeleteTaskAndComments()
    {
        var task = new TaskItem { Id = 1, ProjectId = 10 };
        _taskRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(task);
        _projectRepoMock.Setup(r => r.GetByIdWithDetailsAsync(10)).ReturnsAsync(CreateProject(10, 5));
        _taskRepoMock.Setup(r => r.UpdateAsync(It.IsAny<TaskItem>())).Returns(Task.CompletedTask);
        _commentRepoMock.Setup(r => r.SoftDeleteByTaskAsync(1)).Returns(Task.CompletedTask);

        await CreateService().DeleteAsync(1, userId: 5);

        task.IsDeleted.Should().BeTrue();
        task.DeletedAt.Should().NotBeNull();
        _taskRepoMock.Verify(r => r.UpdateAsync(It.Is<TaskItem>(t => t.IsDeleted)), Times.Once);
        _commentRepoMock.Verify(r => r.SoftDeleteByTaskAsync(1), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenNotFound_ShouldThrowNotFoundException()
    {
        _taskRepoMock.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((TaskItem?)null);

        await CreateService().Invoking(s => s.DeleteAsync(99, 1))
            .Should().ThrowAsync<NotFoundException>();
    }
}
