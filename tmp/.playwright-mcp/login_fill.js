async (page) => {
  const user = "Almazabebe@gmail.com";
  const pass = "0987654321";
  await page.getByRole('textbox', { name: 'Your email' }).fill(user);
  await page.getByRole('textbox', { name: 'Password' }).fill(pass);
  return 'fields-filled: user-len=' + user.length + ' pass-len=' + pass.length;
}