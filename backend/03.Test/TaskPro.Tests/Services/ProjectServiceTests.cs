using AutoMapper;
using BusinessLogic.Adapters;
using Domain.Entity;
using Domain.Exceptions;
using Domain.Interface;
using FluentAssertions;
using Infrastructure.Dto.Project;
using Infrastructure.Mapper;
using Moq;

namespace TaskPro.Tests.Services;

public class ProjectServiceTests
{
    private readonly Mock<IProjectRepository> _projectRepoMock = new();
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly IMapper _mapper;

    public ProjectServiceTests()
    {
        var mapperConfig = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = mapperConfig.CreateMapper();
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateProjectAndAddOwnerAsMember()
    {
        // Arrange
        var request = new CreateProjectRequest { Name = "TaskPro", Description = "Test project" };
        var ownerId = 1;

        _projectRepoMock.Setup(r => r.AddAsync(It.IsAny<Project>()))
            .ReturnsAsync((Project p) => { p.Id = 10; return p; });
        _projectRepoMock.Setup(r => r.AddMemberAsync(It.IsAny<ProjectMember>()))
            .Returns(System.Threading.Tasks.Task.CompletedTask);
        _projectRepoMock.Setup(r => r.GetByIdWithDetailsAsync(10))
            .ReturnsAsync(new Project
            {
                Id = 10, Name = "TaskPro", Description = "Test project", OwnerId = ownerId,
                Owner = new User { Id = ownerId, Name = "Owner" },
                Members = new List<ProjectMember>()
            });

        var service = new ProjectService(_projectRepoMock.Object, _userRepoMock.Object, _mapper);

        // Act
        var result = await service.CreateAsync(request, ownerId);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(request.Name);
        result.OwnerId.Should().Be(ownerId);
        _projectRepoMock.Verify(r => r.AddMemberAsync(It.IsAny<ProjectMember>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenNotOwner_ShouldThrowUnauthorizedException()
    {
        // Arrange
        var project = new Project { Id = 1, OwnerId = 5 };
        _projectRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(project);

        var service = new ProjectService(_projectRepoMock.Object, _userRepoMock.Object, _mapper);

        // Act & Assert
        await service.Invoking(s => s.DeleteAsync(1, userId: 99))
            .Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task GetByIdAsync_WhenProjectNotFound_ShouldThrowNotFoundException()
    {
        // Arrange
        _projectRepoMock.Setup(r => r.GetByIdWithDetailsAsync(99)).ReturnsAsync((Project?)null);

        var service = new ProjectService(_projectRepoMock.Object, _userRepoMock.Object, _mapper);

        // Act & Assert
        await service.Invoking(s => s.GetByIdAsync(99, userId: 1))
            .Should().ThrowAsync<NotFoundException>();
    }
}
