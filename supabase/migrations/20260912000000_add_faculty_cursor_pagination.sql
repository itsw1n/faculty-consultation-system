create function public.list_faculty_page(faculty_search text default '',department_filter uuid default null,cursor_name text default null,cursor_id uuid default null,result_limit int default 20)
returns table(id uuid,full_name text,department_name text,position_title text)
language sql stable security definer set search_path='' as $$
select p.id,p.full_name,d.name,fp.position_title from public.profiles p join public.faculty_profiles fp on fp.user_id=p.id join public.departments d on d.id=p.department_id
where p.role='FACULTY' and p.account_status='APPROVED'
and exists(select 1 from public.profiles viewer where viewer.id=(select auth.uid()) and viewer.account_status='APPROVED')
and (department_filter is null or p.department_id=department_filter)
and (faculty_search='' or p.full_name ilike '%'||faculty_search||'%')
and (cursor_name is null or (lower(p.full_name),p.id)>(lower(cursor_name),cursor_id))
order by lower(p.full_name),p.id limit least(greatest(result_limit,1),50)
$$;
revoke all on function public.list_faculty_page(text,uuid,text,uuid,int) from public;
grant execute on function public.list_faculty_page(text,uuid,text,uuid,int) to authenticated;
