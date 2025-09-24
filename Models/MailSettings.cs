namespace MousaPortfolio.Services;

public class MailSettings
{
    public string Host { get; set; } = "";
    public int Port { get; set; }
    public string User { get; set; } = "";
    public string Pass { get; set; } = "";
    public string FromName { get; set; } = "Portfolio";
    public string To { get; set; } = "";
}
