using AutoMapper;
using BusinessLogic.Ports;
using Domain.Exceptions;
using Domain.Interface;
using Infrastructure.Dto.User;

namespace BusinessLogic.Adapters;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public UserService(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<UserDto> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Domain.Entity.User), id);
        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Domain.Entity.User), id);

        if (user.Email != request.Email && await _userRepository.EmailExistsAsync(request.Email))
            throw new BusinessException("El correo ya está en uso.");

        user.Name = request.Name;
        user.Email = request.Email;
        user.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(request.Password))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);

        await _userRepository.UpdateAsync(user);
        return _mapper.Map<UserDto>(user);
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Domain.Entity.User), id);
        await _userRepository.DeleteAsync(user);
    }
}
