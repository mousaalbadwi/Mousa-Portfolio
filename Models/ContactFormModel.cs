using System.ComponentModel.DataAnnotations;

public class ContactFormModel
{
    [Required, StringLength(80)] public string Name { get; set; } = "";
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Required, StringLength(100)] public string Subject { get; set; } = "";
    [Required, StringLength(2000)] public string Message { get; set; } = "";
    // Honeypot:
    public string? Website { get; set; } // يجب أن تبقى فارغة
}
