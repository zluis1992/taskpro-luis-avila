using FluentValidation;
using Infrastructure.Dto.Task;

namespace Infrastructure.Validators;

public class CreateTaskValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.Priority).InclusiveBetween(0, 3);
    }
}
