using System.Text;
using BusinessLogic.Adapters;
using BusinessLogic.Ports;
using Domain.Interface;
using FluentValidation;
using Infrastructure.Data;
using Infrastructure.Data.Seeders;
using Infrastructure.Mapper;
using Infrastructure.Mongo;
using Infrastructure.Validators;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Repository.Comment;
using Repository.Project;
using Repository.Tasks;
using Repository.User;

namespace API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(config.GetConnectionString("SqlServer")));

        services.AddSingleton(_ => new MongoDbContext(
            config.GetConnectionString("MongoDB")!,
            config["MongoDB:DatabaseName"] ?? "taskpro"));

        return services;
    }

    public static IServiceCollection AddDatabaseInitialization(this IServiceCollection services)
    {
        services.AddScoped<DatabaseInitializationRunner>();
        services.AddScoped<IDatabaseSeeder, DefaultUsersSeeder>();
        services.AddScoped<IDatabaseSeeder, DefaultProjectsSeeder>();
        return services;
    }

    public static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddScoped<ICommentRepository, CommentRepository>();
        return services;
    }

    public static IServiceCollection AddBusinessServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IProjectService, ProjectService>();
        services.AddScoped<ITaskService, TaskService>();
        services.AddScoped<ICommentService, CommentService>();
        return services;
    }

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration config)
    {
        var key = Encoding.UTF8.GetBytes(config["Jwt:Key"]!);

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = config["Jwt:Issuer"],
                    ValidAudience = config["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };
            });

        services.AddAuthorization();
        return services;
    }

    public static IServiceCollection AddSwagger(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "TaskPro API",
                Version = "v1",
                Description = "API REST para la gestión de tareas y proyectos"
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Ingrese el token JWT: Bearer {token}"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }

    public static IServiceCollection AddValidators(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining<LoginValidator>();
        return services;
    }

    public static IServiceCollection AddAutoMapperProfiles(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile));
        return services;
    }
}
