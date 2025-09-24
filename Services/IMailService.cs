namespace MousaPortfolio.Services
{
    public interface IMailService
    {
        Task<bool> SendContactAsync(string name, string email, string subject, string message);
    }

}
