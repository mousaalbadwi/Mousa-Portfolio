namespace MousaPortfolio.Models;
public class Project
{
    public string Title { get; set; } = "";
    public string Desc { get; set; } = "";
    public string Image { get; set; } = "";
    public List<string> Tech { get; set; } = new();
    public string? Repo { get; set; }
    public string? Live { get; set; }
}
