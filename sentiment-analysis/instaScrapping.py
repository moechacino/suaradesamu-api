import instaloader
import pandas as pd

L = instaloader.Instaloader()
try:
    L.login("moescrap", "123321@#$")
except instaloader.exceptions.ConnectionException as e:
    print(f"Login failed: {e}")
    exit()

def scrape_comments(username, max_comments=1000):
    try:
        profile = instaloader.Profile.from_username(L.context, username)
    except instaloader.exceptions.ProfileNotExistsException:
        print(f"Profile {username} not found.")
        return []
    
    comments_list = []
    for post in profile.get_posts():
        for comment in post.get_comments():
            comments_list.append([
                post.date,
                post.shortcode,
                post.title,
                post.url,
                post.owner_profile.profile_pic_url,
                comment.owner.username,
                comment.text
            ])
            if len(comments_list) >= max_comments:
                return comments_list
    
    return comments_list

username = 'angelemythasari'
comments = scrape_comments(username, max_comments=500)

if comments:
    comments_df = pd.DataFrame(comments, columns=['Date',"Shortcode", 'Title', 'Post URL', 'Profile Pic URL', 'Commenter', 'Comment'])
    comments_df.to_excel('angelemythasari_comments.xlsx', index=False)
    print(f"Comments scraped and saved to instagram_comments.xlsx.")
else:
    print("No comments scraped.")
