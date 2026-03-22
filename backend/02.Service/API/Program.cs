using API.Extensions;
using API.Middleware;
using Infrastructure.Data;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Serilog
builder.Host.UseSerilog((ctx, lc) =>
    lc.ReadFrom.Configuration(ctx.Configuration));

// Services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwagger();
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddDatabaseInitialization();
builder.Services.AddRepositories();
builder.Services.AddBusinessServices();
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddValidators();
builder.Services.AddAutoMapperProfiles();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = builder.Configuration["Origins"]?.Split(";") ?? ["http://localhost:3000"];
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

await app.Services.InitializeDatabaseAsync();

app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment() || app.Environment.IsStaging())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
