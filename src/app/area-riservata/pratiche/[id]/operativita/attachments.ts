"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAllowedOperationalAttachment } from "@/lib/operational-attachments";

export async function addOperationalAttachment(data: FormData) {
  const requestId=String(data.get("requestId")??""); const category=String(data.get("category")??""); const file=data.get("file");
  if(!requestId || !["delivery","return","general"].includes(category) || !(file instanceof File) || !isAllowedOperationalAttachment(file.type, file.size)) redirect(`/area-riservata/pratiche/${requestId}/operativita?message=allegato-non-valido`);
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect("/accesso");
  const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,180); const path=`${requestId}/${crypto.randomUUID()}-${safeName}`;
  const {error:uploadError}=await supabase.storage.from("operational-attachments").upload(path,file,{contentType:file.type,upsert:false});
  if(uploadError)redirect(`/area-riservata/pratiche/${requestId}/operativita?message=allegato-non-salvato`);
  const {error}=await supabase.from("request_attachments").insert({request_id:requestId,category,storage_path:path,file_name:file.name.slice(0,240),mime_type:file.type,size_bytes:file.size,author_id:user.id});
  if(error){await supabase.storage.from("operational-attachments").remove([path]); redirect(`/area-riservata/pratiche/${requestId}/operativita?message=allegato-non-salvato`);}
  revalidatePath(`/area-riservata/pratiche/${requestId}/operativita`); redirect(`/area-riservata/pratiche/${requestId}/operativita?message=allegato-salvato`);
}
