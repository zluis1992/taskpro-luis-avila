using AutoMapper;
using BusinessLogic.Adapters;
using Domain.Entity;
using Domain.Exceptions;
using Domain.Interface;
using FluentAssertions;
using Infrastructure.Dto.Auth;
using Infrastructure.Dto.User;
using Infrastructure.Mapper;
using Microsoft.Extensions.Configuration;
using Moq;

namespace TaskPro.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly IMapper _mapper;
    private readonly IConfiguration _config;

    public AuthServiceTests()
    {
        var mapperConfig = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = mapperConfig.CreateMapper();

        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "TestSuperSecretKey-32CharsMinimum!",
                ["Jwt:Issuer"] = "taskpro-api",
                ["Jwt:Audience"] = "taskpro-client",
                ["Jwt:ExpiresMinutes"] = "60"
            })
            .Build();
    }

    [Fact]
    public async Task RegisterAsync_WhenEmailIsNew_ShouldReturnUserDto()
    {
        // Arrange
        var request = new CreateUserRequest { Name = "Luis", Email = "luis@test.com", Password = "secret123" };
        _userRepoMock.Setup(r => r.EmailExistsAsync(request.Email)).ReturnsAsync(false);
        _userRepoMock.Setup(r => r.AddAsync(It.IsAny<User>()))
            .ReturnsAsync((User u) => { u.Id = 1; return u; });

        var service = new AuthService(_userRepoMock.Object, _mapper, _config);

        // Act
        var result = await service.RegisterAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Email.Should().Be(request.Email);
        result.Name.Should().Be(request.Name);
    }

    [Fact]
    public async Task RegisterAsync_WhenEmailExists_ShouldThrowBusinessException()
    {
        // Arrange
        var request = new CreateUserRequest { Name = "Luis", Email = "existing@test.com", Password = "secret123" };
        _userRepoMock.Setup(r => r.EmailExistsAsync(request.Email)).ReturnsAsync(true);

        var service = new AuthService(_userRepoMock.Object, _mapper, _config);

        // Act & Assert
        await service.Invoking(s => s.RegisterAsync(request))
            .Should().ThrowAsync<BusinessException>()
            .WithMessage("*correo electrónico*");
    }

    [Fact]
    public async Task LoginAsync_WithInvalidEmail_ShouldThrowUnauthorizedException()
    {
        // Arrange
        var request = new LoginRequest { Email = "notfound@test.com", Password = "pass" };
        _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync((User?)null);

        var service = new AuthService(_userRepoMock.Object, _mapper, _config);

        // Act & Assert
        await service.Invoking(s => s.LoginAsync(request))
            .Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnToken()
    {
        // Arrange — hash BCrypt de "secret123"
        var password = "secret123";
        var hash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 4);

        var user = new User { Id = 1, Name = "Luis", Email = "luis@test.com", PasswordHash = hash };
        var request = new LoginRequest { Email = user.Email, Password = password };
        _userRepoMock.Setup(r => r.GetByEmailAsync(request.Email)).ReturnsAsync(user);

        var service = new AuthService(_userRepoMock.Object, _mapper, _config);

        // Act
        var result = await service.LoginAsync(request);

        // Assert
        result.Token.Should().NotBeNullOrWhiteSpace();
        result.Email.Should().Be(user.Email);
    }
}
