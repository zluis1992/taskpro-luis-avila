namespace Domain.Entity;

/// <summary>
/// Persisted in MongoDB. Id is a string (ObjectId).
/// </summary>
public class Comment
{
    public string Id { get; set; } = string.Empty;
    public int TaskId { get; set; }
    public int AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    public void SoftDelete()
    {
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
    }
}
