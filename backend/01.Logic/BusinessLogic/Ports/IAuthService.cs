using Infrastructure.Dto.Auth;
using Infrastructure.Dto.User;

namespace BusinessLogic.Ports;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<UserDto> RegisterAsync(CreateUserRequest request);
}
