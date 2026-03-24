using AutoMapper;
using BusinessLogic.Ports;
using Domain.Entity;
using Domain.Exceptions;
using Domain.Interface;
using Infrastructure.Dto.Project;
using Infrastructure.Dto.User;

namespace BusinessLogic.Adapters;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITaskRepository _taskRepository;
    private readonly ICommentRepository _commentRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProjectService(
        IProjectRepository projectRepository,
        IUserRepository userRepository,
        ITaskRepository taskRepository,
        ICommentRepository commentRepository,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _projectRepository = projectRepository;
        _userRepository = userRepository;
        _taskRepository = taskRepository;
        _commentRepository = commentRepository;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ProjectDto>> GetAllForUserAsync(int userId)
    {
        var projects = await _projectRepository.GetByMemberAsync(userId);
        return _mapper.Map<IEnumerable<ProjectDto>>(projects);
    }

    public async Task<ProjectDto> GetByIdAsync(int id, int userId)
    {
        var project = await _projectRepository.GetByIdWithDetailsAsync(id)
            ?? throw new NotFoundException(nameof(Project), id);

        if (project.OwnerId != userId && !project.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedException();

        return _mapper.Map<ProjectDto>(project);
    }

    public async Task<ProjectDto> CreateAsync(CreateProjectRequest request, int ownerId)
    {
        request.Name = request.Name.Trim();
        request.Description = request.Description?.Trim() ?? string.Empty;

        var project = _mapper.Map<Project>(request);
        project.OwnerId = ownerId;

        var created = await _projectRepository.AddAsync(project);
        await _projectRepository.AddMemberAsync(new ProjectMember { ProjectId = created.Id, UserId = ownerId });
        await _unitOfWork.CompleteAsync();

        var detailed = await _projectRepository.GetByIdWithDetailsAsync(created.Id);
        return _mapper.Map<ProjectDto>(detailed!);
    }

    public async Task<ProjectDto> UpdateAsync(int id, UpdateProjectRequest request, int userId)
    {
        request.Name = request.Name.Trim();
        request.Description = request.Description?.Trim() ?? string.Empty;

        var project = await _projectRepository.GetByIdWithDetailsAsync(id)
            ?? throw new NotFoundException(nameof(Project), id);

        if (project.OwnerId != userId)
            throw new UnauthorizedException("Only the project owner can update it.");

        project.Name = request.Name;
        project.Description = request.Description;
        project.UpdatedAt = DateTime.UtcNow;

        await _projectRepository.UpdateAsync(project);
        await _unitOfWork.CompleteAsync();
        return _mapper.Map<ProjectDto>(project);
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var project = await _projectRepository.GetByIdAsync(id)
            ?? throw new NotFoundException(nameof(Project), id);

        if (project.OwnerId != userId)
            throw new UnauthorizedException("Solo el propietario del proyecto puede eliminarlo.");

        var tasks = await _taskRepository.GetByProjectAsync(id);
        foreach (var task in tasks)
        {
            task.SoftDelete();
            await _taskRepository.UpdateAsync(task);
            await _commentRepository.SoftDeleteByTaskAsync(task.Id);
        }

        project.SoftDelete();
        await _projectRepository.UpdateAsync(project);
        await _unitOfWork.CompleteAsync();
    }

    public async Task AddMemberAsync(int projectId, int memberId, int requesterId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId)
            ?? throw new NotFoundException(nameof(Project), projectId);

        if (project.OwnerId != requesterId)
            throw new UnauthorizedException("Only the project owner can add members.");

        if (!await _userRepository.ExistsAsync(u => u.Id == memberId))
            throw new NotFoundException(nameof(Domain.Entity.User), memberId);

        if (await _projectRepository.IsMemberAsync(projectId, memberId))
            throw new BusinessException("User is already a member of this project.");

        await _projectRepository.AddMemberAsync(new ProjectMember { ProjectId = projectId, UserId = memberId });
        await _unitOfWork.CompleteAsync();
    }

    public async Task RemoveMemberAsync(int projectId, int memberId, int requesterId)
    {
        var project = await _projectRepository.GetByIdAsync(projectId)
            ?? throw new NotFoundException(nameof(Project), projectId);

        if (project.OwnerId != requesterId)
            throw new UnauthorizedException("Only the project owner can remove members.");

        if (memberId == project.OwnerId)
            throw new BusinessException("Cannot remove the project owner.");

        await _projectRepository.RemoveMemberAsync(projectId, memberId);
        await _unitOfWork.CompleteAsync();
    }

    public async Task<IEnumerable<UserDto>> GetMembersAsync(int projectId, int userId)
    {
        var project = await _projectRepository.GetByIdWithDetailsAsync(projectId)
            ?? throw new NotFoundException(nameof(Project), projectId);

        if (project.OwnerId != userId && !project.Members.Any(m => m.UserId == userId))
            throw new UnauthorizedException();

        return _mapper.Map<IEnumerable<UserDto>>(project.Members.Select(m => m.User));
    }
}
