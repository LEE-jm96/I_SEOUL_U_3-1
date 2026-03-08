import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/shared/lib/utils';
import { userApi, ROLE_LABELS, USER_STATUS_LABELS } from '@/entities/user';
import { postApi, POST_STATUS_LABELS } from '@/entities/post';
import type { User } from '@/entities/user';
import type { Post } from '@/entities/post';
import { FormFieldGroup } from '@/shared/ui';

type EntityType = 'user' | 'post';
type Entity = User | Post;

export const ManagementContent: React.FC = () => {
  const [entityType, setEntityType] = useState<EntityType>('post');
  const [data, setData] = useState<Entity[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Entity | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
    setFormData({});
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedItem(null);
  }, [entityType]);

  const loadData = async () => {
    try {
      const result =
        entityType === 'user'
          ? await userApi.getAll()
          : await postApi.getAll();
      setData(result);
    } catch {
      setErrorMessage('데이터를 불러오는데 실패했습니다');
      setShowErrorAlert(true);
    }
  };

  const handleCreate = async () => {
    try {
      if (entityType === 'user') {
        await userApi.create({
          username: formData.username ?? '',
          email: formData.email ?? '',
          role: (formData.role as User['role']) || 'user',
          status: (formData.status as User['status']) || 'active',
        });
      } else {
        await postApi.create({
          title: formData.title ?? '',
          content: formData.content ?? '',
          author: formData.author ?? '',
          category: formData.category ?? '',
          status: (formData.status as Post['status']) || 'draft',
        });
      }
      await loadData();
      setIsCreateModalOpen(false);
      setFormData({});
      setAlertMessage(`${entityType === 'user' ? '사용자' : '게시글'}가 생성되었습니다`);
      setShowSuccessAlert(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : '생성에 실패했습니다');
      setShowErrorAlert(true);
    }
  };

  const handleEdit = (item: Entity) => {
    setSelectedItem(item);
    if (entityType === 'user') {
      const user = item as User;
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      const post = item as Post;
      setFormData({
        title: post.title,
        content: post.content,
        author: post.author,
        category: post.category,
        status: post.status,
      });
    }
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      if (entityType === 'user') {
        await userApi.update(selectedItem.id, {
          username: formData.username,
          email: formData.email,
          role: formData.role as User['role'],
          status: formData.status as User['status'],
        });
      } else {
        await postApi.update(selectedItem.id, {
          title: formData.title,
          content: formData.content,
          author: formData.author,
          category: formData.category,
          status: formData.status as Post['status'],
        });
      }
      await loadData();
      setIsEditModalOpen(false);
      setFormData({});
      setSelectedItem(null);
      setAlertMessage(`${entityType === 'user' ? '사용자' : '게시글'}가 수정되었습니다`);
      setShowSuccessAlert(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : '수정에 실패했습니다');
      setShowErrorAlert(true);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      if (entityType === 'user') {
        await userApi.delete(id);
      } else {
        await postApi.delete(id);
      }
      await loadData();
      setAlertMessage('삭제되었습니다');
      setShowSuccessAlert(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : '삭제에 실패했습니다');
      setShowErrorAlert(true);
    }
  };

  const handleStatusAction = async (id: number, action: 'publish' | 'archive' | 'restore') => {
    if (entityType !== 'post') return;
    try {
      if (action === 'publish') await postApi.publish(id);
      else if (action === 'archive') await postApi.archive(id);
      else await postApi.restore(id);
      await loadData();
      const message = action === 'publish' ? '게시' : action === 'archive' ? '보관' : '복원';
      setAlertMessage(`${message}되었습니다`);
      setShowSuccessAlert(true);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : '작업에 실패했습니다');
      setShowErrorAlert(true);
    }
  };

  const getStats = () => {
    if (entityType === 'user') {
      const users = data as User[];
      return {
        total: users.length,
        stat1: { label: '활성', value: users.filter((u) => u.status === 'active').length },
        stat2: { label: '비활성', value: users.filter((u) => u.status === 'inactive').length },
        stat3: { label: '정지', value: users.filter((u) => u.status === 'suspended').length },
        stat4: { label: '관리자', value: users.filter((u) => u.role === 'admin').length },
      };
    } else {
      const posts = data as Post[];
      return {
        total: posts.length,
        stat1: { label: '게시됨', value: posts.filter((p) => p.status === 'published').length },
        stat2: { label: '임시저장', value: posts.filter((p) => p.status === 'draft').length },
        stat3: { label: '보관됨', value: posts.filter((p) => p.status === 'archived').length },
        stat4: { label: '총 조회수', value: posts.reduce((sum, p) => sum + (p.views ?? 0), 0) },
      };
    }
  };

  const renderCell = (row: Record<string, unknown>, key: string) => {
    const value = row[key];
    if (entityType === 'user') {
      if (key === 'role') return <Badge variant="secondary">{ROLE_LABELS[String(value)] || String(value)}</Badge>;
      if (key === 'status') return <Badge variant="outline">{USER_STATUS_LABELS[String(value)] || String(value)}</Badge>;
      if (key === 'lastLogin') return (value as string) || '-';
      if (key === 'actions') {
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleEdit(row as unknown as Entity)}>수정</Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id as number)}>삭제</Button>
          </div>
        );
      }
    }
    if (entityType === 'post') {
      if (key === 'category') return <Badge variant="secondary">{String(value)}</Badge>;
      if (key === 'status') return <Badge variant="outline">{POST_STATUS_LABELS[String(value)] || String(value)}</Badge>;
      if (key === 'views') {
        const n = Number(value);
        return Number.isNaN(n) ? '0' : n.toLocaleString();
      }
      if (key === 'actions') {
        return (
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => handleEdit(row as unknown as Entity)}>수정</Button>
            {row.status === 'draft' && (
              <Button size="sm" onClick={() => handleStatusAction(row.id as number, 'publish')}>게시</Button>
            )}
            {row.status === 'published' && (
              <Button size="sm" variant="secondary" onClick={() => handleStatusAction(row.id as number, 'archive')}>보관</Button>
            )}
            {row.status === 'archived' && (
              <Button size="sm" variant="outline" onClick={() => handleStatusAction(row.id as number, 'restore')}>복원</Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id as number)}>삭제</Button>
          </div>
        );
      }
    }
    return String(value ?? '');
  };

  const columns = entityType === 'user'
    ? [
        { key: 'id', header: 'ID' },
        { key: 'username', header: '사용자명' },
        { key: 'email', header: '이메일' },
        { key: 'role', header: '역할' },
        { key: 'status', header: '상태' },
        { key: 'createdAt', header: '생성일' },
        { key: 'lastLogin', header: '마지막 로그인' },
        { key: 'actions', header: '관리' },
      ]
    : [
        { key: 'id', header: 'ID' },
        { key: 'title', header: '제목' },
        { key: 'author', header: '작성자' },
        { key: 'category', header: '카테고리' },
        { key: 'status', header: '상태' },
        { key: 'views', header: '조회수' },
        { key: 'createdAt', header: '작성일' },
        { key: 'actions', header: '관리' },
      ];

  const stats = getStats();

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto p-5">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-foreground leading-snug">관리 시스템</h1>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">사용자와 게시글을 관리하세요</p>
        </div>

        <div className="rounded border border-[#ddd] bg-white p-5 shadow-sm">
          <div className="mb-4 flex gap-2 border-b-2 border-[#ccc] pb-2">
            <Button
              variant={entityType === 'post' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEntityType('post')}
            >
              게시글
            </Button>
            <Button
              variant={entityType === 'user' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setEntityType('user')}
            >
              사용자
            </Button>
          </div>

          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsCreateModalOpen(true)}>새로 만들기</Button>
          </div>

          {showSuccessAlert && (
            <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900">
              <AlertTitle>성공</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                {alertMessage}
                <Button variant="ghost" size="sm" onClick={() => setShowSuccessAlert(false)}>닫기</Button>
              </AlertDescription>
            </Alert>
          )}

          {showErrorAlert && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>오류</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                {errorMessage}
                <Button variant="ghost" size="sm" onClick={() => setShowErrorAlert(false)}>닫기</Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded border border-[#90caf9] bg-[#e3f2fd] p-3">
              <div className="mb-1 text-xs text-[#666]">전체</div>
              <div className="text-xl font-bold text-[#1976d2] leading-tight">{stats.total}</div>
            </div>
            <div className="rounded border border-[#81c784] bg-[#e8f5e9] p-3">
              <div className="mb-1 text-xs text-[#666]">{stats.stat1.label}</div>
              <div className="text-xl font-bold text-[#388e3c] leading-tight">{stats.stat1.value}</div>
            </div>
            <div className="rounded border border-[#ffb74d] bg-[#fff3e0] p-3">
              <div className="mb-1 text-xs text-[#666]">{stats.stat2.label}</div>
              <div className="text-xl font-bold text-[#f57c00] leading-tight">{stats.stat2.value}</div>
            </div>
            <div className="rounded border border-[#e57373] bg-[#ffebee] p-3">
              <div className="mb-1 text-xs text-[#666]">{stats.stat3.label}</div>
              <div className="text-xl font-bold text-[#d32f2f] leading-tight">{stats.stat3.value}</div>
            </div>
            <div className="rounded border border-[#ba68c8] bg-[#f3e5f5] p-3">
              <div className="mb-1 text-xs text-[#666]">{stats.stat4.label}</div>
              <div className="text-xl font-bold text-[#7b1fa2] leading-tight">{stats.stat4.value}</div>
            </div>
          </div>

          <div className="overflow-auto rounded border border-[#ddd] bg-white [scrollbar-gutter:stable]">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key}>{col.header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx}>
                    {columns.map((col) => (
                      <TableCell key={col.key}>{renderCell(row as unknown as Record<string, unknown>, col.key)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={(open) => { setIsCreateModalOpen(open); if (!open) setFormData({}); }}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>새 {entityType === 'user' ? '사용자' : '게시글'} 만들기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 px-6 py-4">
              {entityType === 'user' ? (
                <>
                  <FormFieldGroup label="사용자명" required>
                    <Input
                      name="username"
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="사용자명을 입력하세요"
                    />
                  </FormFieldGroup>
                  <FormFieldGroup label="이메일" required>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="이메일을 입력하세요"
                    />
                  </FormFieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FormFieldGroup label="역할">
                      <select
                        name="role"
                        value={formData.role || 'user'}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={cn('flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring')}
                      >
                        <option value="user">사용자</option>
                        <option value="moderator">운영자</option>
                        <option value="admin">관리자</option>
                      </select>
                    </FormFieldGroup>
                    <FormFieldGroup label="상태">
                      <select
                        name="status"
                        value={formData.status || 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className={cn('flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring')}
                      >
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                        <option value="suspended">정지</option>
                      </select>
                    </FormFieldGroup>
                  </div>
                </>
              ) : (
                <>
                  <FormFieldGroup label="제목" required>
                    <Input
                      name="title"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="게시글 제목을 입력하세요"
                    />
                  </FormFieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FormFieldGroup label="작성자" required>
                      <Input
                        name="author"
                        value={formData.author || ''}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="작성자명"
                      />
                    </FormFieldGroup>
                    <FormFieldGroup label="카테고리">
                      <select
                        name="category"
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                      >
                        <option value="">카테고리 선택</option>
                        <option value="development">Development</option>
                        <option value="design">Design</option>
                        <option value="accessibility">Accessibility</option>
                      </select>
                    </FormFieldGroup>
                  </div>
                  <FormFieldGroup label="내용">
                    <Textarea
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="게시글 내용을 입력하세요"
                      rows={6}
                    />
                  </FormFieldGroup>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCreateModalOpen(false); setFormData({}); }}>
                취소
              </Button>
              <Button onClick={handleCreate}>생성</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={(open) => { if (!open) { setFormData({}); setSelectedItem(null); } setIsEditModalOpen(open); }}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{entityType === 'user' ? '사용자' : '게시글'} 수정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 px-6 py-4">
              {selectedItem && (
                <Alert>
                  <AlertTitle>정보</AlertTitle>
                  <AlertDescription>
                    ID: {selectedItem.id} | 생성일: {selectedItem.createdAt}
                    {entityType === 'post' && ` | 조회수: ${(selectedItem as Post).views ?? 0}`}
                  </AlertDescription>
                </Alert>
              )}
              {entityType === 'user' ? (
                <>
                  <FormFieldGroup label="사용자명" required>
                    <Input
                      name="username"
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="사용자명을 입력하세요"
                    />
                  </FormFieldGroup>
                  <FormFieldGroup label="이메일" required>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="이메일을 입력하세요"
                    />
                  </FormFieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FormFieldGroup label="역할">
                      <select
                        name="role"
                        value={formData.role || 'user'}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className={cn('flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring')}
                      >
                        <option value="user">사용자</option>
                        <option value="moderator">운영자</option>
                        <option value="admin">관리자</option>
                      </select>
                    </FormFieldGroup>
                    <FormFieldGroup label="상태">
                      <select
                        name="status"
                        value={formData.status || 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className={cn('flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring')}
                      >
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                        <option value="suspended">정지</option>
                      </select>
                    </FormFieldGroup>
                  </div>
                </>
              ) : (
                <>
                  <FormFieldGroup label="제목" required>
                    <Input
                      name="title"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="게시글 제목을 입력하세요"
                    />
                  </FormFieldGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FormFieldGroup label="작성자" required>
                      <Input
                        name="author"
                        value={formData.author || ''}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="작성자명"
                      />
                    </FormFieldGroup>
                    <FormFieldGroup label="카테고리">
                      <select
                        name="category"
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className={cn(
                          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm',
                          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                        )}
                      >
                        <option value="" disabled>카테고리 선택</option>
                        <option value="development">Development</option>
                        <option value="design">Design</option>
                        <option value="accessibility">Accessibility</option>
                      </select>
                    </FormFieldGroup>
                  </div>
                  <FormFieldGroup label="내용">
                    <Textarea
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="게시글 내용을 입력하세요"
                      rows={6}
                    />
                  </FormFieldGroup>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setFormData({}); setSelectedItem(null); }}>
                취소
              </Button>
              <Button onClick={handleUpdate}>수정 완료</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
