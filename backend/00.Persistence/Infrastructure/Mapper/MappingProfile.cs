using AutoMapper;
using Domain.Entity;
using Infrastructure.Dto.Comment;
using Infrastructure.Dto.Project;
using Infrastructure.Dto.Task;
using Infrastructure.Dto.User;

namespace Infrastructure.Mapper;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User
        CreateMap<User, UserDto>()
            .ForMember(d => d.Role, o => o.MapFrom(s => s.Role.ToString()));
        CreateMap<CreateUserRequest, User>();

        // Project
        CreateMap<Project, ProjectDto>()
            .ForMember(d => d.OwnerName, o => o.MapFrom(s => s.Owner.Name))
            .ForMember(d => d.Members, o => o.MapFrom(s => s.Members.Select(m => m.User)));
        CreateMap<CreateProjectRequest, Project>();
        CreateMap<UpdateProjectRequest, Project>();

        // Task
        CreateMap<TaskItem, TaskDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.Priority, o => o.MapFrom(s => s.Priority.ToString()))
            .ForMember(d => d.AssignedUserName, o => o.MapFrom(s => s.AssignedUser != null ? s.AssignedUser.Name : null));
        CreateMap<CreateTaskRequest, TaskItem>();
        CreateMap<UpdateTaskRequest, TaskItem>();

        // Comment
        CreateMap<Comment, CommentDto>();
        CreateMap<CreateCommentRequest, Comment>();
        CreateMap<UpdateCommentRequest, Comment>();
    }
}
