create function public.review_applications(target_user_ids uuid[], decision public.account_status)
returns table (target_user_id uuid, succeeded boolean, error_message text)
language plpgsql security definer set search_path = '' as $$
declare candidate_id uuid;
begin
  if not public.is_admin() then raise exception using errcode='42501',message='Admin access required'; end if;
  foreach candidate_id in array target_user_ids loop
    target_user_id:=candidate_id;succeeded:=true;error_message:=null;
    begin perform public.review_application(candidate_id,decision);
    exception when others then succeeded:=false;error_message:='Application state changed or is invalid'; end;
    return next;
  end loop;
end $$;
revoke all on function public.review_applications(uuid[],public.account_status) from public;
grant execute on function public.review_applications(uuid[],public.account_status) to authenticated;
