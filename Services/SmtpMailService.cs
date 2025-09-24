using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace MousaPortfolio.Services;

public class SmtpMailService : IMailService
{
    private readonly MailSettings _opt;
    private readonly ILogger<SmtpMailService> _log;

    public SmtpMailService(IOptions<MailSettings> opt, ILogger<SmtpMailService> log)
    {
        _opt = opt.Value;
        _log = log;
    }

    public async Task<bool> SendContactAsync(string name, string email, string subject, string message)
    {
        using var client = new SmtpClient(_opt.Host, _opt.Port)
        {
            EnableSsl = true,                    // مهم مع 587
            UseDefaultCredentials = false,       // مهم
            Credentials = new NetworkCredential(_opt.User, _opt.Pass),
            DeliveryMethod = SmtpDeliveryMethod.Network,
            Timeout = 15000
        };

        var mail = new MailMessage
        {
            From = new MailAddress(_opt.User, _opt.FromName),
            Subject = $"[Portfolio] {subject}",
            Body = $"From: {name} <{email}>\n\n{message}",
            IsBodyHtml = false
        };

        // توصلك الرسالة
        mail.To.Add(_opt.To);

        // زر Reply يردّ على مُرسل النموذج
        if (!string.IsNullOrWhiteSpace(email))
            mail.ReplyToList.Add(new MailAddress(email, name));

        try
        {
            await client.SendMailAsync(mail);
            return true;
        }
        catch (Exception ex)
        {
            _log.LogError(ex, "SMTP send failed");
            return false;
        }
    }
}
