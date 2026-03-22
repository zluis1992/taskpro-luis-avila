namespace API.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public int StatusCode { get; set; }

    public static ApiResponse<T> Ok(T? data, string mensaje = "Operación exitosa") =>
        new() { Success = true, Message = mensaje, Data = data, StatusCode = 200 };

    public static ApiResponse<T> Created(T? data, string mensaje = "Registro creado correctamente") =>
        new() { Success = true, Message = mensaje, Data = data, StatusCode = 201 };

    public static ApiResponse<T> Fail(string mensaje, int statusCode = 400) =>
        new() { Success = false, Message = mensaje, Data = default, StatusCode = statusCode };
}
