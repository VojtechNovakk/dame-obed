export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // odstraní diakritiku
    .replace(/\s+/g, "-") // nahradí mezery pomlčkami
    .replace(/[^\w\-]+/g, "") // odstraní všechny nealfanumerické znaky kromě pomlček
    .replace(/\-\-+/g, "-") // nahradí více pomlček jednou
    .replace(/^-+/, "") // ořízne pomlčky ze začátku
    .replace(/-+$/, ""); // ořízne pomlčky z konce
}
