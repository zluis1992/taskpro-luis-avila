using FluentValidation;
using Infrastructure.Dto.Task;

namespace Infrastructure.Validators;

public class UpdateTaskValidator : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("El título es obligatorio.")
            .MaximumLength(200).WithMessage("El título no puede exceder 200 caracteres.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("La descripción no puede exceder 1000 caracteres.");

        RuleFor(x => x.Status)
            .InclusiveBetween(0, 3).WithMessage("El estado debe ser entre 0 y 3.");

        RuleFor(x => x.Priority)
            .InclusiveBetween(0, 3).WithMessage("La prioridad debe ser entre 0 y 3.");
    }
}
