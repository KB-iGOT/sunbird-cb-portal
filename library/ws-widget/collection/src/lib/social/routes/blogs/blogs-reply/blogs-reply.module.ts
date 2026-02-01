import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BlogReplyComponent } from './components/blog-reply.component'
import { PipeSafeSanitizerModule } from '@sunbird-cb/utils-v2'
import { BtnFlagModule } from '../../forums/widgets/buttons/btn-flag/btn-flag.module'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { UserImageModule } from '../../../../_common/user-image/user-image.module'
import { BtnSocialVoteModule } from '../../../../discussion-forum/actionBtn/btn-social-vote/btn-social-vote.module'
import { BtnSocialLikeModule } from '../../../../discussion-forum/actionBtn/btn-social-like/btn-social-like.module'
import { BtnPageBackModule } from '../../../../btn-page-back/btn-page-back.module'
import { EditorQuillModule } from '../../../../discussion-forum/editor-quill/editor-quill.module'

@NgModule({
  declarations: [BlogReplyComponent],
  imports: [
    CommonModule,
    MatCardModule,
    UserImageModule,
    MatMenuModule,
    MatIconModule,
    PipeSafeSanitizerModule,
    MatButtonModule,
    BtnFlagModule,

    BtnSocialVoteModule,
    BtnSocialLikeModule,
    BtnPageBackModule,
    EditorQuillModule,
  ],
  exports: [BlogReplyComponent],
})
export class BlogsReplyModule { }
