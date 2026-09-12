create function public.list_application_page(search_text text default '',status_filter public.account_status default null,role_filter public.user_role default null,department_filter uuid default null,cursor_created_at timestamptz default null,cursor_id uuid default null,result_limit int default 20)
returns table(id uuid,full_name text,email text,requested_role public.user_role,account_status public.account_status,department_name text,created_at timestamptz)
language sql stable security definer set search_path='' as $$
select p.id,p.full_name,p.email,p.requested_role,p.account_status,d.name,p.created_at from public.profiles p left join public.departments d on d.id=p.department_id
where public.is_admin() and (status_filter is null or p.account_status=status_filter) and (role_filter is null or p.requested_role=role_filter) and (department_filter is null or p.department_id=department_filter)
and (search_text='' or p.full_name ilike '%'||search_text||'%' or p.email ilike '%'||search_text||'%') and (cursor_created_at is null or (p.created_at,p.id)<(cursor_created_at,cursor_id))
order by p.created_at desc,p.id desc limit least(greatest(result_limit,1),50)
$$;
revoke all on function public.list_application_page(text,public.account_status,public.user_role,uuid,timestamptz,uuid,int) from public;
grant execute on function public.list_application_page(text,public.account_status,public.user_role,uuid,timestamptz,uuid,int) to authenticated;
